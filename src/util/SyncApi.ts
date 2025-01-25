import axios, { AxiosInstance } from "axios";
import { Snowflake } from "@theinternetfolks/snowflake";

import { KeyManager } from "./EncryptManager";

const HEADER_USER_ID = "StickyUserId";
const HEADER_USER_PASS = "StickyUserPass";

function generatePassword(length = 16) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
    }
    return password;
}

export class SyncApi {
    private endpoint: string = "https://ar-space.art/sssticky/api";
    private axi: AxiosInstance | null = null;
    private user_id: string = "";
    private user_pass: string = "";
    private user_key: KeyManager = new KeyManager();

    constructor() {}

    loadUserCredentials({ user_id, user_pass, user_key }) {
        this.user_id = user_id;
        this.user_pass = user_pass;
        this.user_key = user_key;

        this.createAxi();
    }

    async createUser() {
        const user_id = Snowflake.generate();
        const user_pass = generatePassword(16);

        // send api call to create

        try {
            const form = new FormData();
            form.append("user_id", user_id);
            form.append("pass", user_pass);
            const response = await axios.post(this.endpoint, form);
            const data = response.data;
            if (data?.error === false) {
                console.log("user_created");
            }
        } catch (error) {
            console.warn("user_not_created", error);
        }

        await this.user_key.generateKey();
        const stringKey = this.user_key.exportKeyString(user_pass);
        // if ok save creds and do postfix;
    }

    private createAxi() {
        this.axi = axios.create({
            baseURL: this.endpoint, // Base URL for all requests
            headers: {
                [HEADER_USER_ID]: this.user_id,
                [HEADER_USER_PASS]: this.user_pass,
                "Content-Type": "application/json",
            },
            timeout: 20000, // Optional: Set a timeout for requests
        });
    }

    async checkServer(): Promise<boolean> {
        try {
            const response = await axios.get(this.endpoint);
            return response.status === 200;
        } catch (error) {
            console.error("Error pinging server:", error);
            return false; // Return false if there's an error or if the status code isn't 200
        }
    }
    async getUserLastSync(): Promise<number | null> {
        const resp = await this.axi?.get("/get_last_sync");
        const data = resp?.data;

        if (data && data.error !== false) {
            return data.last_sync; // Assuming last_sync is a number
        } else return null;
    }

    async checkUserAuth(): Promise<boolean> {
        return (await this.checkUserAuth()) !== null;
    }

    async sendDataToSync(data: string): Promise<boolean> {
        const form = new FormData();
        form.append("file", new Blob());

        const resp = await this.axi?.post("put_file", form);
        return resp?.data?.error === false;
    }
    async getSyncedData(last_change: number): Promise<Blob | null> {
        const last_sync = await this.getUserLastSync();
        if (last_sync === null) return null;
        if (last_sync > last_change) {
            const resp = await this.axi?.get("/get_file");
            if (resp?.data?.error) {
                return null; // Return null if there's an error in the response
            }
            // Assuming resp.data is a Blob or can be converted to a Blob
            return new Blob([resp.data]); // Create and return a Blob from the response data
        }
        return null; // Return null if conditions are not met
    }
}
