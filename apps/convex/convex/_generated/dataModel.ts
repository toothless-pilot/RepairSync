/* eslint-disable */
/**
 * Simplified DataModel definitions for the web app to resolve type mappings.
 */
export type Id<TableName extends string> = string & { __tableName: TableName };
