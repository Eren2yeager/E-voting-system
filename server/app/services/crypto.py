import base64
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend

def generate_rsa_keys():
    """
    Generate a fresh 2048-bit RSA key pair.
    Returns: (public_key_pem, private_key_pem) as strings.
    """
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    
    # Serialize private key to PEM format
    private_key_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ).decode('utf-8')
    
    # Serialize public key to PEM format
    public_key = private_key.public_key()
    public_key_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')
    
    return public_key_pem, private_key_pem

def encrypt_vote(candidate_id: str, public_key_pem: str) -> str:
    """
    Encrypt candidate_id using RSA-OAEP with SHA-256.
    Returns: Base64 encoded ciphertext string.
    """
    public_key = serialization.load_pem_public_key(
        public_key_pem.encode('utf-8'),
        backend=default_backend()
    )
    
    ciphertext = public_key.encrypt(
        candidate_id.encode('utf-8'),
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    
    return base64.b64encode(ciphertext).decode('utf-8')

def decrypt_vote(encrypted_vote_b64: str, private_key_pem: str) -> str:
    """
    Decrypt base64 encoded ciphertext using RSA-OAEP with SHA-256.
    Returns: Decrypted candidate_id string.
    """
    private_key = serialization.load_pem_private_key(
        private_key_pem.encode('utf-8'),
        password=None,
        backend=default_backend()
    )
    
    ciphertext = base64.b64decode(encrypted_vote_b64)
    
    plaintext = private_key.decrypt(
        ciphertext,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    
    return plaintext.decode('utf-8')
