import * as cdk from 'aws-cdk-lib';
import { StageName } from '../config/stageConfig';

export interface AppStackProps extends cdk.StackProps {
    stageName: StageName,
}