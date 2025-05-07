import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/utils";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { APP_NAME } from "../config/config";

interface WebsiteStackProps extends AppStackProps {
    websiteDomain: string;
    websiteCertificateArn: string;
}

export class WebsiteStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: WebsiteStackProps) {
        super(scope, id, props);

        const { stageName, websiteDomain, websiteCertificateArn } = props;

        // S3 Bucket to host website files
        const websiteBucketId = `${stageName}-${APP_NAME}-WebsiteBucket`;
        const websiteBucket = new s3.Bucket(this, websiteBucketId, {
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Website Certificate for custom domain
        const websiteCertificate = acm.Certificate.fromCertificateArn(
            this,
            `${stageName}-${APP_NAME}-WebsiteCertificate`,
            websiteCertificateArn,
        );

        // CloudFront Distribution
        const websiteDistributionId = `${stageName}-${APP_NAME}-WebsiteDistribution`;
        const websiteDistribution = new cloudfront.Distribution(this, websiteDistributionId, {
            defaultBehavior: {
                origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            defaultRootObject: "index.html",
            domainNames: [websiteDomain],
            certificate: websiteCertificate,
            errorResponses: [
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: "/index.html",
                },
            ],
        });

        // Stack Outputs used for deploying website
        new cdk.CfnOutput(this, "WebsiteBucketName", {
            value: websiteBucket.bucketName,
        });

        new cdk.CfnOutput(this, "WebsiteDistributionID", {
            value: websiteDistribution.distributionId,
        });
    }
}
