-- Script de creación de tablas

CREATE DATABASE IF NOT EXISTS clinica_san_patras_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;

USE clinica_san_patras_db;

CREATE TABLE paciente (
  codigo          INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(60)  NOT NULL,
  apellidos       VARCHAR(80)  NOT NULL,
  direccion       VARCHAR(120),
  poblacion       VARCHAR(60),
  provincia       VARCHAR(60),
  codigo_postal   CHAR(5),
  telefono        VARCHAR(15),
  fecha_nacimiento DATE        NOT NULL
);

CREATE TABLE medico (
  codigo       INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(60) NOT NULL,
  apellidos    VARCHAR(80) NOT NULL,
  telefono     VARCHAR(15),
  especialidad VARCHAR(80) NOT NULL
);

CREATE TABLE ingreso (
  codigo          INT AUTO_INCREMENT PRIMARY KEY,
  num_habitacion  SMALLINT    NOT NULL,
  cama            TINYINT     NOT NULL,
  fecha_ingreso   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paciente_codigo INT         NOT NULL,
  medico_codigo   INT         NOT NULL,
  CONSTRAINT fk_ingreso_paciente FOREIGN KEY (paciente_codigo)
    REFERENCES paciente(codigo) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_ingreso_medico   FOREIGN KEY (medico_codigo)
    REFERENCES medico(codigo)   ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE usuarios (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  usuario    VARCHAR(50)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  imagen     VARCHAR(255) DEFAULT NULL,
  rol        ENUM('admin','usuario','moderador') NOT NULL DEFAULT 'usuario',
  creado_en  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);