import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/utils";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { APP_NAME } from "../config/constants";

interface WebsiteStackProps extends AppStackProps {}

export class WebsiteStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: WebsiteStackProps) {
        super(scope, id, props);

        const { stageName } = props;

        const websiteBucketId = `${stageName}-${APP_NAME}-WebsiteBucket`;
        const websiteBucket = new s3.Bucket(this, websiteBucketId, {
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        const websiteDistributionId = `${stageName}-${APP_NAME}-WebsiteDistribution`;
        const websiteDistribution = new cloudfront.Distribution(this, websiteDistributionId, {
            defaultBehavior: {
                origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
            },
            defaultRootObject: "index.html",
        });

        new cdk.CfnOutput(this, "WebsiteBucketName", {
            value: websiteBucket.bucketName,
        });

        new cdk.CfnOutput(this, "WebsiteDistributionID", {
            value: websiteDistribution.distributionId,
        });
    }
}
