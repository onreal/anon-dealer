interface Configuration {
    ConfigurationId: number
    Pin: string
    State: string
    TelegramToken: string
    IsBackend: boolean
    ServerUrl: string
    ServerToken: string
    // P2P Signaling Server Configuration
    IsP2PEnabled: boolean
    SignalingServerUrl: string
    SignalingServerWsUrl: string
    P2PDefaultRoom: string
    CreatedOn: Date
    LastLogin: Date
}
