<?php
declare(strict_types=1);

/*
 * FORMULARIO “TRABAJÁ CON NOSOTROS”
 *
 * IMPORTANTE: cuando crees el correo en el hosting, cambiá únicamente la
 * dirección de la siguiente línea. Ahí llegarán los datos y los CV adjuntos.
 */
$recipientEmail = 'rrhh@cosanostraempanadas.com.ar'; // <-- CAMBIAR ESTE CORREO

/* Este remitente debe pertenecer al dominio para mejorar la entrega. */
$senderEmail = 'no-reply@cosanostraempanadas.com.ar';

function redirectToForm(string $status): never
{
    header('Location: /trabaja-con-nosotros?envio=' . $status . '#formulario', true, 303);
    exit;
}

function cleanLine(string $value, int $maxLength): string
{
    $value = trim(strip_tags($value));
    $value = str_replace(["\r", "\n"], ' ', $value);
    return mb_substr($value, 0, $maxLength);
}

function cleanParagraph(string $value, int $maxLength): string
{
    $value = trim(strip_tags($value));
    $value = preg_replace("/\r\n|\r|\n/", "\n", $value) ?? '';
    return mb_substr($value, 0, $maxLength);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    redirectToForm('error');
}

/* Campo trampa para reducir envíos automáticos. */
if (!empty($_POST['website'] ?? '')) {
    redirectToForm('ok');
}

$name = cleanLine((string) ($_POST['nombre'] ?? ''), 100);
$email = filter_var(trim((string) ($_POST['email'] ?? '')), FILTER_VALIDATE_EMAIL);
$phone = cleanLine((string) ($_POST['telefono'] ?? ''), 40);
$branch = cleanLine((string) ($_POST['sucursal'] ?? ''), 80);
$area = cleanLine((string) ($_POST['area'] ?? ''), 80);
$availability = cleanLine((string) ($_POST['disponibilidad'] ?? ''), 80);
$message = cleanParagraph((string) ($_POST['mensaje'] ?? ''), 1500);
$consent = (string) ($_POST['consentimiento'] ?? '');

if (
    $name === '' ||
    $email === false ||
    $phone === '' ||
    $branch === '' ||
    $area === '' ||
    $availability === '' ||
    $consent !== 'acepto'
) {
    redirectToForm('error');
}

if (!isset($_FILES['cv']) || ($_FILES['cv']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    redirectToForm('error');
}

$uploadedFile = $_FILES['cv'];
$maxFileSize = 5 * 1024 * 1024;

if (($uploadedFile['size'] ?? 0) <= 0 || $uploadedFile['size'] > $maxFileSize) {
    redirectToForm('error');
}

$temporaryPath = (string) ($uploadedFile['tmp_name'] ?? '');
if ($temporaryPath === '' || !is_uploaded_file($temporaryPath)) {
    redirectToForm('error');
}

$mimeDetector = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $mimeDetector->file($temporaryPath);
$allowedMimeTypes = [
    'application/pdf' => 'pdf',
    'application/msword' => 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
];

if (!is_string($mimeType) || !isset($allowedMimeTypes[$mimeType])) {
    redirectToForm('error');
}

$safeName = preg_replace('/[^A-Za-z0-9._-]/', '-', $name) ?: 'postulante';
$attachmentName = 'CV-' . trim($safeName, '-') . '.' . $allowedMimeTypes[$mimeType];
$attachmentData = file_get_contents($temporaryPath);

if ($attachmentData === false) {
    redirectToForm('error');
}

$plainText = implode("\n", [
    'Nueva postulación desde la web de Cosa Nostra',
    '',
    'Nombre y apellido: ' . $name,
    'Correo: ' . $email,
    'Teléfono: ' . $phone,
    'Sucursal: ' . $branch,
    'Área: ' . $area,
    'Disponibilidad: ' . $availability,
    '',
    'Presentación:',
    $message !== '' ? $message : 'Sin mensaje adicional.',
    '',
    'La persona aceptó el uso de sus datos para esta postulación laboral.',
]);

$boundary = '=_CosaNostra_' . bin2hex(random_bytes(16));
$subject = 'Nueva postulación: ' . $name . ' · ' . $branch;
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

$headers = [
    'MIME-Version: 1.0',
    'From: Cosa Nostra Web <' . $senderEmail . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'Content-Type: multipart/mixed; boundary="' . $boundary . '"',
    'X-Mailer: PHP/' . PHP_VERSION,
];

$mailBody = '--' . $boundary . "\r\n";
$mailBody .= "Content-Type: text/plain; charset=UTF-8\r\n";
$mailBody .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$mailBody .= $plainText . "\r\n\r\n";
$mailBody .= '--' . $boundary . "\r\n";
$mailBody .= 'Content-Type: ' . $mimeType . '; name="' . $attachmentName . '"' . "\r\n";
$mailBody .= "Content-Transfer-Encoding: base64\r\n";
$mailBody .= 'Content-Disposition: attachment; filename="' . $attachmentName . '"' . "\r\n\r\n";
$mailBody .= chunk_split(base64_encode($attachmentData)) . "\r\n";
$mailBody .= '--' . $boundary . "--\r\n";

$sent = mail(
    $recipientEmail,
    $encodedSubject,
    $mailBody,
    implode("\r\n", $headers),
);

redirectToForm($sent ? 'ok' : 'error');
