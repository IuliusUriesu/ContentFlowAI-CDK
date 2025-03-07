import { APP_DOMAIN } from "./constants";

export enum StageName {
    DEV = "Dev",
    PROD = "Prod",
}

interface StageProps {
    stageName: StageName,
    env: { account: string, region: string },
    websiteDomain: string,
    apiDomain: string,
}

export const stageProps: StageProps[] = 
[
    {
        stageName: StageName.DEV,
        env: { account: "992382391116", region: "eu-central-1" },
        websiteDomain: `dev.${APP_DOMAIN}`,
        apiDomain: `dev.api.${APP_DOMAIN}`,
    },
    {
        stageName: StageName.PROD,
        env: { account: "992382391116", region: "eu-north-1" },
        websiteDomain: `${APP_DOMAIN}`,
        apiDomain: `api.${APP_DOMAIN}`,
    },
];