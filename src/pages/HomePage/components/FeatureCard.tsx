import React, { ReactNode } from 'react'
import { Card, Typography } from 'antd'
import './FeatureCard.css'

const { Title, Paragraph } = Typography

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <Card className="feature-card" hoverable>
      <div className="feature-icon">{icon}</div>
      <Title level={4} className="feature-title">
        {title}
      </Title>
      <Paragraph className="feature-description">
        {description}
      </Paragraph>
    </Card>
  )
}

export default FeatureCard