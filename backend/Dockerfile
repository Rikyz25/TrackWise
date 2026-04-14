FROM php:8.2-apache

# Install PostgreSQL driver
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# (optional) enable rewrite if needed
RUN a2enmod rewrite

# Copy your app
COPY . /var/www/html/