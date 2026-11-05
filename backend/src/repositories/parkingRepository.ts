import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import {
  type DynamoDBDocumentClient,
  QueryCommand,
  type QueryCommandInput,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  CAMPUS_PARTITION,
  CAMPUS_PREFIX,
  PARKING_PREFIX,
  SLOT_PREFIX,
  parkingPartition,
  slotKey,
  slotPartition,
} from '../db/keys.js';
import type { Campus, Parking, Slot, SlotStatus } from '../models/types.js';

/** Data access contract. Routes depend on this interface so tests can use a fake. */
export interface ParkingRepository {
  listCampuses(): Promise<Campus[]>;
  listParkings(campusId: string): Promise<Parking[]>;
  listSlots(campusId: string, parkingId: string): Promise<Slot[]>;
  /** Returns undefined when the slot does not exist. */
  updateSlotStatus(
    campusId: string,
    parkingId: string,
    slotId: string,
    status: SlotStatus,
  ): Promise<Slot | undefined>;
}

/** Removes the PK/SK attributes so API responses only expose domain fields. */
function stripKeys<T>(item: Record<string, unknown>): T {
  const { PK: _pk, SK: _sk, ...rest } = item;
  return rest as T;
}

export class DynamoParkingRepository implements ParkingRepository {
  constructor(
    private readonly doc: DynamoDBDocumentClient,
    private readonly tableName: string,
  ) {}

  listCampuses(): Promise<Campus[]> {
    return this.queryByPrefix<Campus>(CAMPUS_PARTITION, CAMPUS_PREFIX);
  }

  listParkings(campusId: string): Promise<Parking[]> {
    return this.queryByPrefix<Parking>(parkingPartition(campusId), PARKING_PREFIX);
  }

  listSlots(campusId: string, parkingId: string): Promise<Slot[]> {
    return this.queryByPrefix<Slot>(slotPartition(campusId, parkingId), SLOT_PREFIX);
  }

  async updateSlotStatus(
    campusId: string,
    parkingId: string,
    slotId: string,
    status: SlotStatus,
  ): Promise<Slot | undefined> {
    try {
      const result = await this.doc.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: slotKey(campusId, parkingId, slotId),
          UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
          ConditionExpression: 'attribute_exists(PK)',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: {
            ':status': status,
            ':updatedAt': new Date().toISOString(),
          },
          ReturnValues: 'ALL_NEW',
        }),
      );
      return result.Attributes ? stripKeys<Slot>(result.Attributes) : undefined;
    } catch (err) {
      if (err instanceof ConditionalCheckFailedException) return undefined;
      throw err;
    }
  }

  /** Queries a partition by SK prefix, following pagination. */
  private async queryByPrefix<T>(pk: string, skPrefix: string): Promise<T[]> {
    const items: T[] = [];
    let exclusiveStartKey: QueryCommandInput['ExclusiveStartKey'];

    do {
      const page = await this.doc.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
          ExpressionAttributeValues: { ':pk': pk, ':prefix': skPrefix },
          ExclusiveStartKey: exclusiveStartKey,
        }),
      );
      for (const item of page.Items ?? []) items.push(stripKeys<T>(item));
      exclusiveStartKey = page.LastEvaluatedKey;
    } while (exclusiveStartKey);

    return items;
  }
}
