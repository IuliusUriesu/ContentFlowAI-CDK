import { APP_DOMAIN } from "./constants";

export enum StageName {
    DEV = "Dev",
    PROD = "Prod",
}

interface StageProps {
    stageName: StageName,
    env: { account: string, region: string },
    websiteUrl: string,
    apiUrl: string,
}

export const stageProps: StageProps[] = 
[
    {
        stageName: StageName.DEV,
        env: { account: "992382391116", region: "eu-central-1" },
        websiteUrl: `dev.${APP_DOMAIN}`,
        apiUrl: `dev.api.${APP_DOMAIN}`,
    },
    {
        stageName: StageName.PROD,
        env: { account: "992382391116", region: "eu-north-1" },
        websiteUrl: `${APP_DOMAIN}`,
        apiUrl: `api.${APP_DOMAIN}`,
    },
];