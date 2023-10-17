#!/bin/sh

aws s3 cp "s3://$S3_BUCKET$S3_CERT_PATH" /certs/server.crt
aws s3 cp "s3://$S3_BUCKET$S3_KEY_PATH" /certs/server.key

exit 0