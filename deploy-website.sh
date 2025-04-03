#!/bin/bash

if [ "$#" -ne 2 ]; then
    echo "Error: Incorrect usage."
    echo "Usage: ./deploy-website.sh <WEBSITE_STACK_NAME> <AWS_REGION>"
    exit 1
fi

WEBSITE_STACK_NAME=$1
AWS_REGION=$2

BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name "$WEBSITE_STACK_NAME" \
    --region $AWS_REGION \
    --query "Stacks[0].Outputs[?OutputKey=='WebsiteBucketName'].OutputValue" \
    --output text)

DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name "$WEBSITE_STACK_NAME" \
    --region $AWS_REGION \
    --query "Stacks[0].Outputs[?OutputKey=='WebsiteDistributionID'].OutputValue" \
    --output text)

if [ -z "$BUCKET_NAME" ] || [ -z "$DISTRIBUTION_ID" ]; then
    echo "Error: Could not fetch the stack outputs. Ensure that the correct stack name and region are provided, and that the stack outputs 'WebsiteBucketName' and 'WebsiteDistributionID'."
    exit 1
fi 

echo "Uploading website build to S3 Bucket..."
aws s3 sync ../ContentFlowAI-Website/build s3://$BUCKET_NAME --delete --region $AWS_REGION

echo "Invalidating CloudFront distribution cache..."
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" --region $AWS_REGION

echo "Website deployed successfully!"