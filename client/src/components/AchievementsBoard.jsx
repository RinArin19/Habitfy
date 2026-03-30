import React, { useMemo } from 'react';
import { Award, Zap, Star, Target, Crown, Flame, Shield, Diamond, Mountain, Crosshair } from 'lucide-react';

function AchievementsBoard({ habits }) {
  const achievements = useMemo(() => {
    const totalHabits = habits.length;
    const completedTodayCount = habits.filter(h => h.completedToday).length;
    const maxStreak = totalHabits > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
    const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0);

    return [
      {
        id: 'first_step',
        title: 'First Step',
        desc: 'Complete your first habit of the day',
        icon: Target,
        unlocked: completedTodayCount >= 1,
        color: '#3b82f6' // Blue
      },
      {
        id: 'momentum',
        title: 'Momentum',
        desc: 'Complete 3 habits in a single day',
        icon: Zap,
        unlocked: completedTodayCount >= 3,
        color: '#eab308' // Yellow
      },
      {
        id: 'perfect_day',
        title: 'Perfect Day',
        desc: '100% of habits completed today',
        icon: Star,
        unlocked: totalHabits > 0 && completedTodayCount === totalHabits,
        color: '#f59e0b' // Gold
      },
      {
        id: 'starter',
        title: 'Ambitious Starter',
        desc: 'Have 5 or more active habits',
        icon: Crosshair,
        unlocked: totalHabits >= 5,
        color: '#8b5cf6' // Purple
      },
      {
        id: 'builder',
        title: 'Master Builder',
        desc: 'Have 10 or more active habits',
        icon: Crown,
        unlocked: totalHabits >= 10,
        color: '#ec4899' // Pink
      },
      {
        id: 'warrior_7',
        title: '7-Day Warrior',
        desc: 'Reach a 7-day streak on any habit',
        icon: Flame,
        unlocked: maxStreak >= 7,
        color: '#ef4444' // Red
      },
      {
        id: 'iron_will_14',
        title: 'Iron Will',
        desc: 'Reach a 14-day streak on any habit',
        icon: Shield,
        unlocked: maxStreak >= 14,
        color: '#64748b' // Slate/Silver
      },
      {
        id: 'legend_30',
        title: '30-Day Legend',
        desc: 'Reach a 30-day streak on any habit',
        icon: Diamond,
        unlocked: maxStreak >= 30,
        color: '#0ea5e9' // Light Blue/Cyan
      },
      {
        id: 'mountaineer',
        title: 'Mountaineer',
        desc: 'Total active streaks surpass 50 days combined',
        icon: Mountain,
        unlocked: totalStreak >= 50,
        color: '#22c55e' // Green
      },
      {
        id: 'century_club',
        title: 'Century Club',
        desc: 'Combined active streaks hit 100 days',
        icon: Award,
        unlocked: totalStreak >= 100,
        color: '#4f46e5' // Indigo
      }
    ];
  }, [habits]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🏆 Trophy Case
          </h2>
          <p>You have unlocked {unlockedCount} out of {achievements.length} badges!</p>
        </div>
        
        {/* Progress Bar */}
        <div style={{ flex: '1', minWidth: '200px', maxWidth: '300px' }}>
          <div style={{ width: '100%', background: 'rgba(0,0,0,0.1)', height: '12px', borderRadius: '12px', overflow: 'hidden' }}>
             <div style={{ 
                height: '100%', 
                background: 'linear-gradient(90deg, #4f46e5, #ec4899)', 
                width: `${(unlockedCount / achievements.length) * 100}%`,
                transition: 'width 1s ease-in-out'
             }} />
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {achievements.map((badge) => {
          const IconComponent = badge.icon;
          return (
            <div 
              key={badge.id}
              className="animate-slide-up"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: badge.unlocked ? `linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))` : 'rgba(255,255,255,0.2)',
                borderLeft: badge.unlocked ? `4px solid ${badge.color}` : '4px solid transparent',
                borderRadius: '12px',
                opacity: badge.unlocked ? 1 : 0.5,
                transform: badge.unlocked ? 'scale(1.02)' : 'none',
                transition: 'all 0.3s ease',
                boxShadow: badge.unlocked ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
              }}
            >
              <div style={{ 
                background: badge.unlocked ? badge.color : '#9ca3af', 
                color: 'white', 
                padding: '0.75rem', 
                borderRadius: '50%',
                display: 'flex',
                boxShadow: badge.unlocked ? `0 0 15px ${badge.color}66` : 'none'
              }}>
                <IconComponent size={24} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: badge.unlocked ? 'var(--text-main)' : '#6b7280' }}>
                  {badge.title}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {badge.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AchievementsBoard;
