#!/bin/sh

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

until nc -z $host $port; do
  >&2 echo "Kafka is unavailable - sleeping"
  sleep 1
done

>&2 echo "Kafka is up - executing command"
exec $cmd