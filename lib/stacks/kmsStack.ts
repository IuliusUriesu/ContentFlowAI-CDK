import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/utils";
import * as kms from "aws-cdk-lib/aws-kms";

export class KmsStack extends cdk.Stack {
    public readonly userAnthropicApiKeyMasterKey: kms.IKey;

    constructor(scope: Construct, id: string, props: AppStackProps) {
        super(scope, id, props);

        const { stageName } = props;

        const userAnthropicApiKeyMasterKeyName = `${stageName}-UserAnthropicApiKeyMasterKey`;
        this.userAnthropicApiKeyMasterKey = new kms.Key(this, userAnthropicApiKeyMasterKeyName, {
            alias: `alias/${userAnthropicApiKeyMasterKeyName}`,
            description:
                "This master key is used to encrypt all the data keys used for encrypting users' Anthropic API keys",
            enableKeyRotation: true,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
    }
}
