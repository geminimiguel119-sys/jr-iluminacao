FROM php:8.2-apache

# Instala bibliotecas do PostgreSQL e ativa drivers do PHP
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql

# Habilita mod_rewrite no Apache para lidar com requisições e rotas
RUN a2enmod rewrite

# Copia todos os arquivos do projeto para o diretório padrão do Apache
COPY . /var/www/html/

# Ajusta permissões dos arquivos
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80