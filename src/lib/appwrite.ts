import { Client, Account, Databases, Query } from "appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("68a568df00155ab4407d");

export const account = new Account(client);
export const databases = new Databases(client);
export { Query };

export function setJWT(jwt: string) {
  client.setJWT(jwt);
}
