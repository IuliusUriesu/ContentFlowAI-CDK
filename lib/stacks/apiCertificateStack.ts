import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/utils";
import { APP_NAME } from "../config/constants";

interface ApiCertificateStackProps extends AppStackProps {
    apiDomain: string;
}

export class ApiCertificateStack extends cdk.Stack {
    public readonly apiCertificate: acm.ICertificate;

    constructor(scope: Construct, id: string, props: ApiCertificateStackProps) {
        super(scope, id, props);

        const { stageName, apiDomain } = props;

        const apiCertificateName = `${stageName}-${APP_NAME}-ApiCertificate`;

        this.apiCertificate = new acm.Certificate(this, apiCertificateName, {
            domainName: apiDomain,
            certificateName: apiCertificateName,
            validation: acm.CertificateValidation.fromDns(),
        });
    }
}
