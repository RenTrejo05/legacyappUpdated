import { MongoClient, Db, Collection } from "mongodb";
import type { User, Project, Task, Comment, HistoryEntry, Notification } from "@/types";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI no está definido en las variables de entorno");
}

// Reutilizar el cliente en el entorno de desarrollo
const globalForMongo = globalThis as unknown as {
  _mongoClient?: MongoClient;
};

let client: MongoClient;

if (!globalForMongo._mongoClient) {
  globalForMongo._mongoClient = new MongoClient(uri);
}

client = globalForMongo._mongoClient;

export async function getDb(): Promise<Db> {
  if (!client.topology) {
    await client.connect();
  }
  return client.db("legacyapp");
}

export async function usersCollection(): Promise<Collection<User>> {
  const db = await getDb();
  return db.collection<User>("users");
}

export async function projectsCollection(): Promise<Collection<Project>> {
  const db = await getDb();
  return db.collection<Project>("projects");
}

export async function tasksCollection(): Promise<Collection<Task>> {
  const db = await getDb();
  return db.collection<Task>("tasks");
}

export async function commentsCollection(): Promise<Collection<Comment>> {
  const db = await getDb();
  return db.collection<Comment>("comments");
}

export async function historyCollection(): Promise<Collection<HistoryEntry>> {
  const db = await getDb();
  return db.collection<HistoryEntry>("history");
}

export async function notificationsCollection(): Promise<
  Collection<Notification>
> {
  const db = await getDb();
  return db.collection<Notification>("notifications");
}

