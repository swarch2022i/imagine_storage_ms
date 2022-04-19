# IMAGINE

## Microservice storage for Imagine application.

### How to run

This application uses [Google Cloud Storage](https://cloud.google.com/storage/?utm_source=google), so first you need have an google account service file, like this:

```json
{
  "type": "service_account",
  "project_id": "",
  "private_key_id": "",
  "private_key": "",
  "client_email": "",
  "client_id": "",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": ""
}
```

If you don't know how to create an account service, look [GCS docs](https://cloud.google.com/iam/docs/service-accounts).

Now you have your account service file, it's time to prepare your enviroment file like this (you have a .env template in root dir):

```js
GCS_BUCKET=bucket_name
GCS_FILE=name_of_gcs_file
GCS_PROJECT_ID=project_id
GCS_ENDPOINT="https://storage.googleapis.com/"
```

then you can do:

```shell
$npm install
```

finally:

```shell
$npm run start
```

---

You also have an Dockerfile if you want to dockerize this microservice, just remember to modify `EXPOSE PORT` if you needed.

---

### How to use

This microservice is an REST API, the first endpoint is for uploading new images to bucket:

```bash
$curl --location --request POST 'http://localhost:3000/api/storage/upload' \
--form 'images=@"/F:/Downloads/5vtnfe.jpg"' \
--form 'userId="user"' \
--form 'albumId="newAlbum"'
```

Response:

```json
{
    "msg": "successful upload",
    "urls": [
        {
            "id": "DQ0hLp",
            "url": "https://storage.googleapis.com/arqui/cesar/nuevo/DQ0hLp.jpg"
        }
    ]
}
```

Also you can delete images from bucket:

```bash
$curl --location --request DELETE 'http://localhost:3000/api/storage/4gcqjT'
```

Response:
```json
{
    "msg": "Deleted image",
    "name": "user-id/album-id/4gcqjT.jpg"
}
```

And you can get the image link from the bucket:

```bash
$curl --location --request GET 'http://localhost:3000/api/storage/DQ0hLp'
```

Response:

```json
{
    "url": "https://storage.googleapis.com/arqui/user-id/album-id/DQ0hLp.jpg"
}
```

**Cesar Augusto Solano Corzo.**  
_April, 2022_

