/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import certificatesRoutes from './routes/certificates.js'
import gamificationRoutes from './routes/gamification.js'
import analyticsRoutes from './routes/analytics.js'
import profileRoutes from './routes/profile.js'
import uploadsRoutes from './routes/uploads.js'
import missionsRoutes from './routes/missions.js'
import coursesRoutes from './routes/courses.js'
import examsRoutes from './routes/exams.js'
import badgesRoutes from './routes/badges.js'
import achievementsRoutes from './routes/achievements.js'
import pathsRoutes from './routes/paths.js'
import { createUser, updateUser, deleteUser, syncUser } from './routes/users.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/certificates', certificatesRoutes)
app.use('/api/gamification', gamificationRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/uploads', uploadsRoutes)
app.use('/api/courses', coursesRoutes)
app.use('/api/missions', missionsRoutes)
app.use('/api/exams', examsRoutes)
app.use('/api/badges', badgesRoutes)
app.use('/api/achievements', achievementsRoutes)
app.use('/api/paths', pathsRoutes)

// Rotas de usuários (CRUD administrativo)
app.post('/api/users', createUser)
app.post('/api/users/sync', syncUser)
app.put('/api/users/:id', updateUser)
app.delete('/api/users/:id', deleteUser)

// Endpoint de teste para verificar conexão com Supabase
app.get('/api/health', async (req, res) => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.SUPABASE_URL || 'https://your-project.supabase.co',
      process.env.SUPABASE_ANON_KEY || 'your-anon-key'
    );

    // Testar conexão com uma consulta simples
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      res.json({
        status: 'error',
        message: 'Erro ao conectar com Supabase',
        error: error.message,
        supabase_configured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
      });
    } else {
      res.json({
        status: 'ok',
        message: 'Conexão com Supabase funcionando',
        supabase_configured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.json({
      status: 'error',
      message: 'Erro interno',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
