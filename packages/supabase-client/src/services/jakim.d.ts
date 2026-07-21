import { MalaysianState } from "@masjid-suite/shared-types";
/**
 * The shape of the zone object our application's UI components expect.
 */
export interface UiJakimZone {
    value: string;
    label: string;
    state: MalaysianState;
}
export declare class JakimService {
    /**
     * Fetches all JAKIM prayer time zones from the external API.
     * @returns A promise that resolves to an array of UiJakimZone objects.
     */
    getZones(): Promise<UiJakimZone[]>;
}
export declare const jakimService: JakimService;
//# sourceMappingURL=jakim.d.ts.map