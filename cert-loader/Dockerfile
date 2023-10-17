FROM amazon/aws-cli
COPY fetch-certs.sh .
RUN chmod +x fetch-certs.sh
ENTRYPOINT ["./fetch-certs.sh"]