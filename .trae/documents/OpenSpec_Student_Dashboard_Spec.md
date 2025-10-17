# Student Dashboard Capability Spec

## Purpose
Provide students with a personalized dashboard showing their learning progress, achievements, recommendations, and quick access to platform features.

## ADDED Requirements

### Requirement: Personalized learning progress display
Students SHALL view their comprehensive learning progress across all enrolled courses and activities.

#### Scenario: View overall progress summary
- Given I am a student accessing my dashboard
- When I view the progress section
- Then I see my overall completion percentage
- And I see progress for each enrolled course
- And I see time spent learning this week/month
- And I see my learning streak information
- And progress updates reflect recent activities

#### Scenario: Detailed course progress
- Given I want to see specific course details
- When I click on a course in my progress view
- Then I see module-by-module completion status
- And I see estimated time to complete remaining content
- And I see my performance metrics for that course
- And I can quickly resume where I left off

#### Scenario: Learning analytics insights
- Given I want to understand my learning patterns
- When I access the analytics section
- Then I see my most productive learning times
- And I see my preferred content types
- And I see areas where I excel or need improvement
- And I get personalized tips for better learning

### Requirement: Achievement and gamification display
Students SHALL view their earned achievements, badges, and gamification progress.

#### Scenario: View earned achievements
- Given I have completed learning activities
- When I access the achievements section
- Then I see all badges I've earned with dates
- And I see my current points and level
- And I see progress toward next achievements
- And I can share achievements on social platforms

#### Scenario: Leaderboard and rankings
- Given I want to see my competitive standing
- When I view the leaderboard section
- Then I see my ranking among peers
- And I can filter by course, timeframe, or department
- And I see top performers (anonymized if needed)
- And I can opt-in/out of leaderboard participation

#### Scenario: Achievement details and requirements
- Given I want to understand achievement criteria
- When I click on any badge or achievement
- Then I see detailed requirements to earn it
- And I see my current progress toward that achievement
- And I get suggestions on how to complete it
- And I can set it as a personal goal

### Requirement: Personalized course recommendations
Students SHALL receive intelligent course recommendations based on their interests, progress, and goals.

#### Scenario: View recommended courses
- Given the system has analyzed my learning patterns
- When I access the recommendations section
- Then I see courses tailored to my interests
- And I see courses that complement my current learning
- And I see popular courses in my department/role
- And recommendations update based on my activities

#### Scenario: Explore learning paths
- Given I want structured learning guidance
- When I view learning paths section
- Then I see curated sequences of courses
- And I see my progress through active learning paths
- And I can enroll in new learning paths
- And I get estimated completion times

#### Scenario: Skill gap analysis
- Given I want to identify learning opportunities
- When I access skill assessment
- Then I see my current skill levels
- And I see recommended skills for my role
- And I get course suggestions to fill skill gaps
- And I can track skill development over time

### Requirement: Quick access to platform features
Students SHALL access frequently used platform features directly from their dashboard.

#### Scenario: Quick navigation to active content
- Given I want to continue my learning efficiently
- When I view the dashboard quick actions
- Then I see "Continue Learning" for my last activity
- And I see upcoming deadlines and due dates
- And I see new content notifications
- And I can bookmark important resources

#### Scenario: Social learning features access
- Given I want to engage with the learning community
- When I access social features from dashboard
- Then I can see recent discussions I'm following
- And I can view study group activities
- And I can see peer achievements and celebrations
- And I can quickly post questions or insights

#### Scenario: Calendar and schedule integration
- Given I want to manage my learning schedule
- When I view the calendar widget
- Then I see upcoming live sessions or deadlines
- And I can schedule personal study time
- And I get reminders for important events
- And I can sync with external calendars

### Requirement: Customizable dashboard layout
Students SHALL personalize their dashboard layout and content preferences.

#### Scenario: Customize widget arrangement
- Given I want to personalize my dashboard
- When I enter customization mode
- Then I can drag and drop dashboard widgets
- And I can resize widgets to my preference
- And I can hide widgets I don't use
- And my layout preferences are saved automatically

#### Scenario: Set learning preferences
- Given I want to tailor my learning experience
- When I access dashboard preferences
- Then I can set my preferred content types
- And I can configure notification preferences
- And I can set learning goals and targets
- And I can choose my preferred difficulty level

## Technical Implementation Notes

### Data Architecture
- Real-time progress tracking with efficient caching
- Personalization engine for recommendations
- Achievement system with rule-based triggers
- Analytics pipeline for learning insights

### Frontend Components
```typescript
interface StudentDashboardProps {
  userId: string;
  preferences: DashboardPreferences;
  layout: DashboardLayout;
}

interface LearningProgress {
  overallCompletion: number;
  coursesInProgress: CourseProgress[];
  timeSpentThisWeek: number;
  currentStreak: number;
  totalPoints: number;
  currentLevel: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt?: Date;
  progress: number;
  requirements: AchievementRequirement[];
}

interface Recommendation {
  courseId: string;
  title: string;
  reason: string;
  confidence: number;
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
```

### Performance Requirements
- Dashboard loads in < 1.5 seconds
- Progress updates reflect within 30 seconds
- Recommendations refresh daily or on significant events
- Smooth animations and transitions

### Personalization Engine
- Machine learning for course recommendations
- Behavioral analysis for learning patterns
- A/B testing for dashboard optimizations
- Privacy-preserving analytics

## Database Schema Extensions

```sql
-- Student dashboard preferences
CREATE TABLE student_dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  layout_config JSONB DEFAULT '{}',
  widget_preferences JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  learning_goals JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Learning progress tracking
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  course_id UUID NOT NULL,
  lesson_id UUID,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning streaks
CREATE TABLE learning_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Course recommendations
CREATE TABLE course_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  course_id UUID NOT NULL,
  recommendation_type VARCHAR(50) NOT NULL, -- 'interest', 'skill_gap', 'popular', 'continuation'
  confidence_score DECIMAL(3,2),
  reason TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  clicked_at TIMESTAMP WITH TIME ZONE,
  enrolled_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE
);

-- Learning goals
CREATE TABLE learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  goal_type VARCHAR(50) NOT NULL, -- 'course_completion', 'skill_development', 'time_based'
  target_value JSONB NOT NULL,
  current_value JSONB DEFAULT '{}',
  target_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social learning activities
CREATE TABLE social_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  activity_type VARCHAR(50) NOT NULL, -- 'discussion', 'question', 'achievement_share'
  content TEXT,
  related_course_id UUID,
  related_lesson_id UUID,
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'course', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard analytics
CREATE TABLE dashboard_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_learning_progress_user_course ON learning_progress(user_id, course_id);
CREATE INDEX idx_learning_progress_updated ON learning_progress(updated_at DESC);
CREATE INDEX idx_learning_streaks_user ON learning_streaks(user_id);
CREATE INDEX idx_course_recommendations_user ON course_recommendations(user_id, generated_at DESC);
CREATE INDEX idx_learning_goals_user_status ON learning_goals(user_id, status);
CREATE INDEX idx_social_activities_user ON social_activities(user_id, created_at DESC);
CREATE INDEX idx_dashboard_analytics_user_event ON dashboard_analytics(user_id, event_type, created_at DESC);

-- RLS Policies
ALTER TABLE student_dashboard_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_analytics ENABLE ROW LEVEL SECURITY;

-- Students can only access their own data
CREATE POLICY "students_own_dashboard_data" ON student_dashboard_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "students_own_progress" ON learning_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "students_own_streaks" ON learning_streaks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "students_own_recommendations" ON course_recommendations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "students_own_goals" ON learning_goals
  FOR ALL USING (auth.uid() = user_id);

-- Social activities have more complex visibility rules
CREATE POLICY "social_activities_visibility" ON social_activities
  FOR SELECT USING (
    visibility = 'public' OR 
    (visibility = 'course' AND EXISTS (
      SELECT 1 FROM learning_progress lp 
      WHERE lp.user_id = auth.uid() AND lp.course_id = social_activities.related_course_id
    )) OR
    user_id = auth.uid()
  );

CREATE POLICY "students_own_analytics" ON dashboard_analytics
  FOR ALL USING (auth.uid() = user_id);
```

## API Endpoints

### GET /api/student/dashboard
Get complete dashboard data for student

**Response:**
```json
{
  "progress": {
    "overallCompletion": 68.5,
    "coursesInProgress": [
      {
        "courseId": "course-123",
        "title": "React Fundamentals",
        "completion": 75,
        "timeSpent": 1200,
        "lastAccessed": "2025-01-15T10:30:00Z"
      }
    ],
    "timeSpentThisWeek": 480,
    "currentStreak": 7,
    "totalPoints": 2450,
    "currentLevel": 12
  },
  "achievements": [
    {
      "id": "achievement-456",
      "name": "Course Completionist",
      "description": "Complete 5 courses",
      "progress": 80,
      "earnedAt": null
    }
  ],
  "recommendations": [
    {
      "courseId": "course-789",
      "title": "Advanced React Patterns",
      "reason": "Based on your progress in React Fundamentals",
      "confidence": 0.85
    }
  ],
  "quickActions": [
    {
      "type": "continue_learning",
      "title": "Continue React Fundamentals",
      "url": "/courses/course-123/lessons/lesson-456"
    }
  ]
}
```

### PUT /api/student/dashboard/preferences
Update dashboard preferences

**Request:**
```json
{
  "layoutConfig": {
    "widgets": [
      {"id": "progress", "position": {"x": 0, "y": 0, "w": 6, "h": 4}},
      {"id": "achievements", "position": {"x": 6, "y": 0, "w": 6, "h": 4}}
    ]
  },
  "notificationSettings": {
    "achievementNotifications": true,
    "recommendationNotifications": false,
    "streakReminders": true
  }
}
```

### GET /api/student/progress
Get detailed learning progress

### GET /api/student/achievements
Get achievements and badges

### GET /api/student/recommendations
Get personalized course recommendations

### POST /api/student/goals
Create or update learning goals

### GET /api/student/social/feed
Get social learning activity feed

### POST /api/student/analytics/event
Track dashboard interaction events

## Testing Scenarios

### Unit Tests
- Dashboard components render with correct data
- Progress calculations are accurate
- Recommendation engine produces relevant suggestions
- Achievement tracking works correctly

### Integration Tests
- Dashboard data loads from multiple sources correctly
- Real-time updates work properly
- Personalization preferences persist
- Social features integrate smoothly

### Performance Tests
- Dashboard loads quickly with large amounts of data
- Progress updates don't cause performance issues
- Recommendation generation is efficient
- Analytics tracking doesn't impact user experience

### User Experience Tests
- Dashboard is intuitive and easy to navigate
- Customization features work as expected
- Mobile responsiveness is maintained
- Accessibility standards are met

## Monitoring and Alerts

### Performance Metrics
- Dashboard load times
- Widget rendering performance
- API response times
- Database query efficiency

### Engagement Metrics
- Dashboard visit frequency
- Widget interaction rates
- Customization usage
- Feature adoption rates

### Learning Metrics
- Progress tracking accuracy
- Recommendation click-through rates
- Goal completion rates
- Achievement earning patterns

### Technical Metrics
- Error rates and types
- Cache hit rates
- Real-time update latency
- Mobile vs desktop usage patterns