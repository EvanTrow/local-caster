export interface CastDevice {
	address: string;
	friendlyName: string;
}

export interface DiscoveredCastDevice {
	host: string;
	addresses: string[];
	port: number;
	fullname: string;
	id: string;
	version: string;
	model: string;
	iconPath: string;
	friendlyName: string;
	certificateAuthority: string;
	streaming: string;
	appName: string;
}
