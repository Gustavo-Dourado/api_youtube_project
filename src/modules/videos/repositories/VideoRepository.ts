import { pool } from '../../../mysql';
import {v4 as uuidv4} from 'uuid';
import {Request, Response} from 'express';

class VideoRepository {
    create(request: Request, response: Response){
     const {user_id, title, image, description, channel, views, upload_date} = request.body
     pool.getConnection((err: any, connection: any) =>{
          connection.query(
             'INSERT INTO videos (video_id, user_id, image, title, description, channel, views, upload_date) VALUES(?,?,?,?,?,?,?,?)',
             [uuidv4(), user_id, image, title, description, channel, views, upload_date],
             (error : any, result: any, fields: any) => {
                if (error){
                    return response.status(400).json(error)
                }
         
                response.status(200).json({message: "Vídeo criado com sucesso"})
             }
          )
     })
    }

    getVideos(request: Request, response: Response){
        const {user_id} = request.query
        pool.getConnection((err: any, connection: any) =>{
            
            connection.query(
                'SELECT * FROM videos WHERE user_id = ?',
                [user_id],
                (error : any, results: any, fields: any) => {
                connection.release();
                    if (error){
                    return response.status(400).json({error: "Erro ao buscar vídeos"})
                    }
                    return response.status(200).json({message: "Videos retornados com sucesso", videos: results})
                }
            )
        })
    }

    //A procura por vídeos é feita pela API do Youtube no frontend
    async searchVideos(request: Request, response: Response){
        const API_KEY = process.env.YOUTUBE_API_KEY
        const {searchContent} = request.query
    
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&order=viewCount&q=${searchContent}&type=video&key=${API_KEY}`
        
        try{
            const results = await fetch(url)
            const resultsJson = await results.json()
            
            return response.status(200).json({message: "Vídeos encontrados com sucesso", videos: resultsJson.items})

        } catch(error){ 
            console.log(error)
        }
    }

    async searchVideosByCategory(request: Request, response: Response){
        const API_KEY = process.env.YOUTUBE_API_KEY
        const {categoryId} = request.query

        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&order=viewCount&q=${categoryId}&type=video&key=${API_KEY}`
        try{
            const results = await fetch(url)
            const resultsJson = await results.json()
            
            return response.status(200).json({message: "Vídeos encontrados com sucesso", videos: resultsJson.items})
        } catch(error){ 
            console.log(error)
        } 
    }
}

export {VideoRepository}