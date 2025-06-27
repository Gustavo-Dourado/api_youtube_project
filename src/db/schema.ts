import { pool } from "../mysql";
import { PoolConnection, MysqlError } from "mysql";

const createTables = async () => {
  return new Promise<void>((resolve, reject) => {
    pool.getConnection((err: MysqlError, connection: PoolConnection) => {
      if (err) {
        if (connection) connection.release();
        return reject(err);
      }

      connection.query(
        `CREATE TABLE IF NOT EXISTS users (
          user_id VARCHAR(45) NOT NULL,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL,
          password VARCHAR(150) NOT NULL,
          PRIMARY KEY (user_id)
        );`,
        (error) => {
          if (error) {
            connection.release();
            return reject(error);
          }

          connection.query(
            `CREATE TABLE IF NOT EXISTS videos (
              video_id VARCHAR(45) NOT NULL,
              title VARCHAR(100) NOT NULL,
              description VARCHAR(100) NULL,
              user_id VARCHAR(45) NOT NULL,
              image VARCHAR(200) NOT NULL,
              channel VARCHAR(100) NOT NULL,
              views VARCHAR(10) NULL,
              upload_date VARCHAR(35) NOT NULL,
              PRIMARY KEY (video_id),
              INDEX fk_videos_users_idx (user_id ASC),
              CONSTRAINT fk_videos_users
                FOREIGN KEY (user_id)
                REFERENCES users (user_id)
            );`,
            (error2) => {
              connection.release();

              if (error2) {
                return reject(error2);
              }

              console.log("Tabelas criadas com sucesso.");
              resolve();
            }
          );
        }
      );
    });
  });
};

// Executa a criação e encerra pool
createTables()
  .then(() => {
    console.log("Script finalizado.");
  })
  .catch((err) => {
    console.error("Erro ao criar tabelas:", err);
  })
  .finally(() => {
    pool.end(); // encerra pool após queries
  });
