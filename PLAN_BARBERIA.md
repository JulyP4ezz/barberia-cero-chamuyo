# Sistema de Turnos para Barberos "Cero Chamuyo"

Vamos a armar una **Aplicación Web (con diseño Responsive)**. Esto significa que la misma página web va a acomodarse sola para verse de diez tanto en la PC que junta pelos en el mostrador del local, como en el celu del cliente mientras viaja en el bondi. 

Para lograrlo, vamos a armar una arquitectura dividida en dos partes:
- **Frontend (Lo que ve el usuario):** Vamos a usar React (a través de Vite) para que sea rapidísimo. El diseño lo haremos bien "premium" (nada de páginas grises y aburridas).
- **Backend (El motor y los datos):** Usaremos Node.js con Express y una base de datos SQLite (fácil de mover y no requiere instalar un motor pesado aparte; la libretita digital perfecta).

## Requisitos y Preguntas Clave:

La aplicación web necesita estar alojada en un servidor (hosteada) en algún lado si querés que los clientes de verdad entren por internet con su celular. Para arrancar, te voy a armar y probar todo para que corra en tu máquina (local). Más adelante, si da el cuero, lo subimos a internet de verdad.

1. **Horarios:** Dijiste que calculemos **1 hora por turno**. Eso nos facilita la matemática. Voy a dejar pre-configurado de 10:00 a 19:00 hs por ahora (asumiendo que el último turno es a las 18:00 hs). Si es otro horario decime en el chat.
2. **Panel del barbero:** ¿Arrancamos directo haciendo un "Panel de Administrador" (donde entra el barbero para ver quién viene en el día), o primero nos enfocamos solo en la pantalla del cliente para que saque turno y la probamos a fondo?
3. **Estética:** ¿El barbero tiene algún estilo visual en el local? ¿Vamos por un modo oscuro elegante, o le mandamos rojo, azul y blanco estilo "barber pole" clásico? Tirame esa data en el chat así diseño algo con onda.

## Componentes a crear

### Frontend (React + Vite)
Esta es la cara visible de la app, donde el cliente hace la autogestión.
- src/main.jsx
- src/App.jsx
- src/components/BarberSelector.jsx
- src/components/ServiceSelector.jsx
- src/components/TurnoForm.jsx
- src/index.css

### Backend (Node.js + Express) & Base de Datos (SQLite)
El cerebro que anota en la "libretita digital" y no te pierde los datos.
- server/index.js
- server/database.js

---
**¡Contestame por el chat las 3 preguntas y arrancamos!**
