
import boto3
import os
import io


def main():
    s3_token = os.getenv("CLOUDFLARE_S3_token_id")
    s3_secret = os.getenv("cloudflare_s3_token_secret")
    account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
    s3 = boto3.resource(service_name="s3",
                        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com/",
                        aws_access_key_id=s3_token,
                        aws_secret_access_key=s3_secret
                        )
    for item in os.listdir("public/zips"):
        with io.FileIO(f"public/zips/{item}") as file:
            s3.ObjectSummary(bucket_name='otter-gallery', key=f'zips/{item}').put(Body=file)


if os.getenv("CF_PAGES_BRANCH") == "master":
    main()
