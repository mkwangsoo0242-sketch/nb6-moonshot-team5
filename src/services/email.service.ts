import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendInvitationEmail(to: string, projectName: string, inviteLink: string) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject: `[Moonshot] ${projectName} 프로젝트에 초대되었습니다`,
      html: `
        <h2>프로젝트 초대</h2>
        <p>${projectName} 프로젝트에 초대되었습니다.</p>
        <p>아래 링크를 클릭하여 초대를 수락해주세요:</p>
        <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
          초대 수락하기
        </a>
        <p>이 링크는 7일 후 만료됩니다.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send invitation email:', error);
    }
  }

  async sendProjectDeletedNotification(emails: string[], projectName: string) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: emails,
      subject: `[Moonshot] ${projectName} 프로젝트가 삭제되었습니다`,
      html: `
        <h2>프로젝트 삭제 알림</h2>
        <p>참여 중이던 <strong>${projectName}</strong> 프로젝트가 삭제되었습니다.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send project deleted notification:', error);
    }
  }
}

export const emailService = new EmailService();
