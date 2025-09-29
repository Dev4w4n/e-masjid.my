import type { MalaysianState, MasjidAddress, ProfileAddress } from './types.js';
export declare const STATE_MAPPING: Record<string, MalaysianState>;
export declare function normalizeStateName(state: string): MalaysianState | null;
export declare function formatAddress(address: ProfileAddress | MasjidAddress): string;
export declare function formatAddressSingleLine(address: ProfileAddress | MasjidAddress): string;
export declare function formatAddressMultiLine(address: ProfileAddress | MasjidAddress): string[];
export declare function getStateAbbreviation(state: MalaysianState): string;
export declare const POSTCODE_TO_STATE: Record<string, MalaysianState>;
export declare function guessStateFromPostcode(postcode: string): MalaysianState | null;
export declare function isPostcodeValidForState(postcode: string, state: MalaysianState): boolean;
export declare const STATE_CITIES: Record<MalaysianState, string[]>;
export declare function isValidCityForState(city: string, state: MalaysianState): boolean;
export declare function profileAddressToMasjidAddress(address: ProfileAddress): MasjidAddress;
export declare function masjidAddressToProfileAddress(address: MasjidAddress, profileId: string, addressType?: 'home' | 'work' | 'other'): Omit<ProfileAddress, 'id' | 'created_at' | 'updated_at'>;
//# sourceMappingURL=address.d.ts.map