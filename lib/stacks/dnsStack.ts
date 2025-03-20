import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";
import { AppStackProps } from "../utils/utils";
import { APP_NAME } from "../config/constants";

interface DnsStackProps extends AppStackProps {
    websiteDomain: string;
    apiDomain: string;
}

export class DnsStack extends cdk.Stack {
    public websiteCertificate: acm.ICertificate;
    public apiCertificate: acm.ICertificate;

    constructor(scope: Construct, id: string, props: DnsStackProps) {
        super(scope, id, props);

        const { stageName, websiteDomain, apiDomain } = props;

        const websiteCertificateName = `${stageName}-${APP_NAME}-WebsiteCertificate`;
        const apiCertificateName = `${stageName}-${APP_NAME}-ApiCertificate`;

        this.websiteCertificate = new acm.Certificate(this, websiteCertificateName, {
            domainName: websiteDomain,
            certificateName: websiteCertificateName,
            validation: acm.CertificateValidation.fromDns(),
        });

        this.apiCertificate = new acm.Certificate(this, apiCertificateName, {
            domainName: apiDomain,
            certificateName: apiCertificateName,
            validation: acm.CertificateValidation.fromDns(),
        });
    }
}
