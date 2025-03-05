import * as cdk from 'aws-cdk-lib';
import { StageName } from '../config/appConfig';

export interface AppStackProps extends cdk.StackProps {
    stageName: StageName,
}