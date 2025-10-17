import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Users, 
  Trophy, 
  Bell, 
  Search, 
  Plus,
  Heart,
  MessageCircle,
  Share2,
  Filter,
  TrendingUp,
  Calendar,
  Award,
  Target,
  UserCheck
} from 'lucide-react';
import { SocialFeed } from '@/components/social/SocialFeed';
import { ForumDiscussions } from '@/components/social/ForumDiscussions';
import { StudyGroups } from '@/components/social/StudyGroups';
import { SocialLeaderboard } from '@/components/social/SocialLeaderboard';
import { SocialChallenges } from '@/components/social/SocialChallenges';
import { PrivateMessages } from '@/components/social/PrivateMessages';
import { UserDirectory } from '@/components/social/UserDirectory';
import { AchievementPosts } from '@/components/social/AchievementPosts';
import { ShareAchievement } from '@/components/social/ShareAchievement';
import { Competitions } from '@/components/social/Competitions';
import { NotificationBell, NotificationDropdown } from '@/components/social/SocialNotifications';

export function StudentSocial() {
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Área Social
              </h1>
              <p className="text-gray-600">
                Conecte-se com outros estudantes, participe de discussões e colabore no aprendizado
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar discussões, grupos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              
              {activeTab === 'achievements' ? (
                <ShareAchievement 
                  trigger={
                    <Button size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar Conquista
                    </Button>
                  }
                />
              ) : (
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Post
                </Button>
              )}
              
              <NotificationDropdown>
                <Button variant="outline" size="sm" className="relative">
                  <NotificationBell />
                </Button>
              </NotificationDropdown>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Posts Criados</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Grupos Ativos</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <Users className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Ranking Social</p>
                    <p className="text-2xl font-bold">#12</p>
                  </div>
                  <Trophy className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Pontos Sociais</p>
                    <p className="text-2xl font-bold">1,247</p>
                  </div>
                  <Award className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-9 bg-white shadow-sm">
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="discussions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Fóruns
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Grupos
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Desafios
            </TabsTrigger>
            <TabsTrigger value="competitions" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Competições
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="profiles" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Perfis
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Mensagens
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <SocialFeed searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="discussions" className="space-y-6">
            <ForumDiscussions searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <StudyGroups searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <SocialChallenges searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="competitions" className="space-y-6">
            <Competitions />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <AchievementPosts />
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <SocialLeaderboard />
          </TabsContent>

          <TabsContent value="profiles" className="space-y-6">
            <UserDirectory />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <PrivateMessages />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}