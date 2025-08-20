// lib/appwrite.ts
import { Client, Databases, Query } from "appwrite";

const client = new Client();
client
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("68a568df00155ab4407d");

export const databases = new Databases(client);
export { Query };
