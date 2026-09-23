# Étape 1 : installation des dépendances Composer
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY . .
RUN composer dump-autoload --optimize --no-dev --no-scripts

# Étape 2 : image finale php-fpm
FROM php:8.3-fpm-alpine

RUN apk add --no-cache postgresql-dev libzip-dev $PHPIZE_DEPS \
    && docker-php-ext-install pdo pdo_pgsql zip pcntl \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS

WORKDIR /var/www

COPY --from=vendor /app /var/www

RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 storage bootstrap/cache

USER www-data

EXPOSE 9000

CMD ["php-fpm"]
