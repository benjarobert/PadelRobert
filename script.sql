CREATE DATABASE PadelDBRobert;
GO
USE PadelDBRobert;
GO

CREATE LOGIN prog2 WITH PASSWORD = 'prog2', DEFAULT_DATABASE = PadelDBRobert;
GO
CREATE USER prog2 FOR LOGIN prog2;
ALTER ROLE db_owner ADD MEMBER prog2;
GO

CREATE TABLE dbo.Canchas (
    IdCancha      INT IDENTITY(1,1) NOT NULL,
    Nombre        NVARCHAR(100)     NOT NULL,
    PrecioPorHora DECIMAL(10,2)     NOT NULL,
    CONSTRAINT PK_Canchas PRIMARY KEY (IdCancha),
    CONSTRAINT UQ_Canchas_Nombre UNIQUE (Nombre),
    CONSTRAINT CK_Canchas_Precio CHECK (PrecioPorHora > 0)
);
GO

CREATE TABLE dbo.Reservas (
    IdReserva  INT IDENTITY(1,1) NOT NULL,
    IdCancha   INT               NOT NULL,
    Cliente    NVARCHAR(100)     NOT NULL,
    Fecha      DATE              NOT NULL,
    Hora       NVARCHAR(5)       NOT NULL,
    Pagada     BIT               NOT NULL CONSTRAINT DF_Reservas_Pagada DEFAULT 0,
    CONSTRAINT PK_Reservas PRIMARY KEY (IdReserva),
    CONSTRAINT FK_Reservas_Canchas FOREIGN KEY (IdCancha)
        REFERENCES dbo.Canchas (IdCancha),
    CONSTRAINT UQ_Reservas_Horario UNIQUE (IdCancha, Fecha, Hora)
);
GO

CREATE OR ALTER PROCEDURE dbo.usp_ListarCanchas
AS BEGIN SET NOCOUNT ON;
    SELECT IdCancha, Nombre, PrecioPorHora
    FROM dbo.Canchas
    ORDER BY IdCancha;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_ListarReservas
AS BEGIN SET NOCOUNT ON;
    SELECT
        R.IdReserva, R.IdCancha,
        C.Nombre AS Cancha,
        C.PrecioPorHora,
        R.Cliente, R.Fecha, R.Hora, R.Pagada
    FROM dbo.Reservas R
    INNER JOIN dbo.Canchas C ON C.IdCancha = R.IdCancha
    ORDER BY R.Fecha, R.Hora;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_CrearReserva
    @IdCancha INT,
    @Cliente  NVARCHAR(100),
    @Fecha    DATE,
    @Hora     NVARCHAR(5)
AS BEGIN SET NOCOUNT ON;
    IF @Cliente IS NULL OR LTRIM(RTRIM(@Cliente)) = N''
        THROW 50003, 'Debe indicar el nombre del cliente.', 1;

    IF NOT EXISTS (SELECT 1 FROM dbo.Canchas WHERE IdCancha = @IdCancha)
        THROW 50002, 'La cancha indicada no existe.', 1;

    IF EXISTS (SELECT 1 FROM dbo.Reservas
               WHERE IdCancha = @IdCancha AND Fecha = @Fecha AND Hora = @Hora)
        THROW 50011, 'Ese horario ya está reservado para esta cancha.', 1;

    INSERT INTO dbo.Reservas (IdCancha, Cliente, Fecha, Hora)
    VALUES (@IdCancha, LTRIM(RTRIM(@Cliente)), @Fecha, @Hora);

    SELECT SCOPE_IDENTITY() AS IdReserva;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_RegistrarPago
    @IdReserva INT
AS BEGIN SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM dbo.Reservas WHERE IdReserva = @IdReserva)
        THROW 50002, 'La reserva indicada no existe.', 1;

    IF (SELECT Pagada FROM dbo.Reservas WHERE IdReserva = @IdReserva) = 1
        THROW 50008, 'La reserva ya fue pagada.', 1;

    UPDATE dbo.Reservas SET Pagada = 1 WHERE IdReserva = @IdReserva;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_RecaudacionPorCancha
AS BEGIN SET NOCOUNT ON;
    SELECT
        C.IdCancha,
        C.Nombre,
        COUNT(R.IdReserva) AS CantidadReservas,
        ISNULL(SUM(CASE WHEN R.Pagada = 1 THEN C.PrecioPorHora ELSE 0 END), 0) AS TotalCobrado,
        ISNULL(SUM(CASE WHEN R.Pagada = 0 THEN C.PrecioPorHora ELSE 0 END), 0) AS TotalPendiente
    FROM dbo.Canchas C
    LEFT JOIN dbo.Reservas R ON R.IdCancha = C.IdCancha
    GROUP BY C.IdCancha, C.Nombre
    ORDER BY C.IdCancha;
END
GO

SET NOCOUNT ON;
INSERT INTO Canchas (Nombre, PrecioPorHora)
VALUES
    (N'Cancha 1 - Cristal', 28000.00),
    (N'Cancha 2 - Panorámica', 25000.00),
    (N'Cancha 3 - Césped azul', 22000.00);

DECLARE @C1 INT = (SELECT IdCancha FROM Canchas WHERE Nombre = N'Cancha 1 - Cristal');
DECLARE @C2 INT = (SELECT IdCancha FROM Canchas WHERE Nombre = N'Cancha 2 - Panorámica');

INSERT INTO Reservas (IdCancha, Cliente, Fecha, Hora, Pagada)
VALUES
    (@C1, N'Martín López',       CAST(GETDATE() AS DATE), N'18:00', 1),
    (@C1, N'Carolina Gómez',     CAST(GETDATE() AS DATE), N'19:00', 0),
    (@C2, N'Federico Ruiz',      CAST(GETDATE() AS DATE), N'20:00', 1),
    (@C1, N'Luciana Fernández',  CAST(DATEADD(DAY,1,GETDATE()) AS DATE), N'17:00', 0),
    (@C2, N'Gonzalo Pérez',      CAST(DATEADD(DAY,1,GETDATE()) AS DATE), N'18:00', 1),
    (@C2, N'Sofía Martínez',     CAST(DATEADD(DAY,1,GETDATE()) AS DATE), N'21:00', 0),
    (@C1, N'Diego Sánchez',      CAST(DATEADD(DAY,2,GETDATE()) AS DATE), N'19:30', 1),
    (@C2, N'Valentina Castro',   CAST(DATEADD(DAY,2,GETDATE()) AS DATE), N'20:30', 0);
GO
