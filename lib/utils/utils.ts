import * as cdk from "aws-cdk-lib";
import { StageName } from "../config/config";

export interface AppStackProps extends cdk.StackProps {
    stageName: StageName;
}
