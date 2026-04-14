FROM php:8.2-apache

# Copy backend files
COPY . /var/www/html/

# Enable Apache rewrite
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Expose port
EXPOSE 80