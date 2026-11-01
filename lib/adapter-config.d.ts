// Extend the adapter configuration with this adapter's native settings.
declare global {
    namespace ioBroker {
        interface AdapterConfig {
            ip: string;
        }
    }
}

export {};
