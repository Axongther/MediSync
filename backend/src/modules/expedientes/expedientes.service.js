const pool = require('../../config/db');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../../config/s3');

const getByPaciente = async (patientId) => {
  const [records] = await pool.query(
    `SELECT mr.*, u.name AS doctor_nombre, d.specialty
     FROM medical_records mr
     JOIN doctors d ON mr.doctor_id = d.id
     JOIN users u ON d.user_id = u.id
     WHERE mr.patient_id = ?
     ORDER BY mr.record_date DESC`, [patientId]
  );

  for (const record of records) {
    const [attachments] = await pool.query(
      'SELECT * FROM record_attachments WHERE record_id = ?', [record.id]
    );
    record.attachments = attachments;
  }

  return records;
};

const create = async (data) => {
  const { patient_id, doctor_id, appointment_id, visit_reason, diagnosis, treatment, notes } = data;
  const [result] = await pool.query(
    'INSERT INTO medical_records (patient_id, doctor_id, appointment_id, visit_reason, diagnosis, treatment, notes, record_date) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())',
    [patient_id, doctor_id, appointment_id, visit_reason, diagnosis, treatment, notes]
  );
  return { id: result.insertId, message: 'Registro médico creado' };
};

const update = async (id, data) => {
  const { visit_reason, diagnosis, treatment, notes } = data;
  await pool.query(
    'UPDATE medical_records SET visit_reason = ?, diagnosis = ?, treatment = ?, notes = ? WHERE id = ?',
    [visit_reason, diagnosis, treatment, notes, id]
  );
  return { id, message: 'Registro médico actualizado' };
};

const uploadAdjunto = async (recordId, file) => {
  const timestamp = Date.now();
  const key = `expedientes/${recordId}/${timestamp}_${file.originalname}`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  }));

  const fileUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  const [result] = await pool.query(
    'INSERT INTO record_attachments (record_id, file_url, file_name, file_type) VALUES (?, ?, ?, ?)',
    [recordId, fileUrl, file.originalname, file.mimetype]
  );

  return { id: result.insertId, file_url: fileUrl, file_name: file.originalname, message: 'Archivo subido' };
};

const getAdjuntos = async (recordId) => {
  const [rows] = await pool.query(
    'SELECT * FROM record_attachments WHERE record_id = ?', [recordId]
  );
  return rows;
};

const deleteAdjunto = async (archivoId) => {
  await pool.query('DELETE FROM record_attachments WHERE id = ?', [archivoId]);
};

module.exports = { getByPaciente, create, update, uploadAdjunto, getAdjuntos, deleteAdjunto };