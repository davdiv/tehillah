#!/bin/bash

openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout privateKey.key -out publicCertificate.crt
openssl pkcs12 -export -out privateKey.pfx -inkey privateKey.key -in publicCertificate.crt
