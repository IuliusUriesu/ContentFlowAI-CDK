import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';
import { AppStackProps } from '../utils/appStackProps';
import { APP_NAME } from '../config/constants';

interface DnsStackProps extends AppStackProps {
    websiteUrl: string,
    apiUrl: string,
}

export class DnsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: DnsStackProps) {
        super(scope, id, props);

        const { stageName, websiteUrl, apiUrl } = props;

        const websiteCertificateName = `${stageName}-${APP_NAME}-WebsiteCertificate`;
        const apiCertificateName = `${stageName}-${APP_NAME}-ApiCertificate`;

        new acm.Certificate(this, websiteCertificateName, {
            domainName: websiteUrl,
            certificateName: websiteCertificateName,
            validation: acm.CertificateValidation.fromDns(),
        });

        new acm.Certificate(this, apiCertificateName, {
            domainName: apiUrl,
            certificateName: apiCertificateName,
            validation: acm.CertificateValidation.fromDns(),
        });
    }
}