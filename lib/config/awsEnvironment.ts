import { StageName } from "./appConfig";

interface AwsEnvironment {
    stageName: StageName,
    account: string,
    region: string,
}

export const environments: AwsEnvironment[] = 
[
    {
        stageName: StageName.DEV,
        account: "992382391116",
        region: "eu-central-1",
    },
    {
        stageName: StageName.PROD,
        account: "992382391116",
        region: "eu-north-1",
    },
];