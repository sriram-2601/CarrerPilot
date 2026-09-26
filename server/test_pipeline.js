import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { seedInitialData } from './src/services/seedService.js';
import { textToPdf } from './src/utils/pdf.js';

async function testPipeline() {
  await connectDB();
  await seedInitialData();

  const server = app.listen(5097, async () => {
    try {
      // 1. Login demo user
      const loginRes = await fetch('http://localhost:5097/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@careerpilot.ai', password: 'Password@123' })
      });
      const { token } = await loginRes.json();

      // 2. Generate a valid PDF
      const pdfText = 'Alex Rivera\nSoftware Engineer Intern\nSkills: React, Node.js, Express, MongoDB, JavaScript, Git\nProjects: Cloud Task Manager with real time sync\nEducation: B.S. Computer Science 2026';
      const pdfBuffer = textToPdf(pdfText);

      // 3. Upload multipart
      const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
      let headerStr = `--${boundary}\r\n`;
      headerStr += 'Content-Disposition: form-data; name="resume"; filename="resume.pdf"\r\n';
      headerStr += 'Content-Type: application/pdf\r\n\r\n';
      const bodyHeader = Buffer.from(headerStr, 'latin1');
      const bodyFooter = Buffer.from(`\r\n--${boundary}--\r\n`, 'latin1');
      const payload = Buffer.concat([bodyHeader, pdfBuffer, bodyFooter]);

      const uploadRes = await fetch('http://localhost:5097/api/profile/upload-resume', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'multipart/form-data; boundary=' + boundary
        },
        body: payload
      });

      const uploadData = await uploadRes.json();
      console.log('Upload status:', uploadRes.status);
      console.log('Extracted skills:', uploadData.profile?.skills);
      console.log('Upload message:', uploadData.message);

      // 4. Test Match generation
      const matchRes = await fetch('http://localhost:5097/api/matches/generate', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const matchData = await matchRes.json();
      console.log('Matches generated count:', matchData.count, 'Top score:', matchData.matches?.[0]?.score);

      // 5. Test Tailored Resume preparation
      const firstInternshipId = matchData.matches?.[0]?.internshipId;
      const genVariantRes = await fetch('http://localhost:5097/api/application-materials/generate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ internshipId: firstInternshipId })
      });
      const variantData = await genVariantRes.json();
      console.log('Tailored resume version created:', Boolean(variantData.version));
      console.log('Tailored changes:', variantData.version?.changeSummary);

      // 6. Test PDF export of tailored resume
      const pdfExportRes = await fetch(`http://localhost:5097/api/application-materials/${variantData.version._id}/pdf`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      console.log('PDF export status:', pdfExportRes.status, 'Content-Type:', pdfExportRes.headers.get('content-type'));

      // 7. Test Tracker
      const appsRes = await fetch('http://localhost:5097/api/applications', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const apps = await appsRes.json();
      console.log('Tracked applications count:', apps.length, 'Status:', apps[0]?.status);

      // 8. Test Analytics
      const analyticsRes = await fetch('http://localhost:5097/api/analytics', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const analytics = await analyticsRes.json();
      console.log('Analytics status counts:', analytics.statusCounts);

      server.close(() => {
        console.log('Backend pipeline tests successfully executed!');
        process.exit(0);
      });
    } catch (e) {
      console.error('Test error:', e);
      server.close(() => process.exit(1));
    }
  });
}

testPipeline();
