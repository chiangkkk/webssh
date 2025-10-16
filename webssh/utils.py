import ipaddress
import re
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import base64

try:
    from types import UnicodeType
except ImportError:
    UnicodeType = str

try:
    from urllib.parse import urlparse
except ImportError:
    from urlparse import urlparse


numeric = re.compile(r'[0-9]+$')
allowed = re.compile(r'(?!-)[a-z0-9-]{1,63}(?<!-)$', re.IGNORECASE)


def to_str(bstr, encoding='utf-8'):
    if isinstance(bstr, bytes):
        return bstr.decode(encoding)
    return bstr


def to_bytes(ustr, encoding='utf-8'):
    if isinstance(ustr, UnicodeType):
        return ustr.encode(encoding)
    return ustr


def to_int(string):
    try:
        return int(string)
    except (TypeError, ValueError):
        pass


def to_ip_address(ipstr):
    ip = to_str(ipstr)
    if ip.startswith('fe80::'):
        ip = ip.split('%')[0]
    return ipaddress.ip_address(ip)


def is_valid_ip_address(ipstr):
    try:
        to_ip_address(ipstr)
    except ValueError:
        return False
    return True


def is_valid_port(port):
    return 0 < port < 65536


def is_valid_encoding(encoding):
    try:
        u'test'.encode(encoding)
    except LookupError:
        return False
    except ValueError:
        return False
    return True


def is_ip_hostname(hostname):
    it = iter(hostname)
    if next(it) == '[':
        return True
    for ch in it:
        if ch != '.' and not ch.isdigit():
            return False
    return True


def is_valid_hostname(hostname):
    if hostname[-1] == '.':
        # strip exactly one dot from the right, if present
        hostname = hostname[:-1]
    if len(hostname) > 253:
        return False

    labels = hostname.split('.')

    # the TLD must be not all-numeric
    if numeric.match(labels[-1]):
        return False

    return all(allowed.match(label) for label in labels)


def is_same_primary_domain(domain1, domain2):
    i = -1
    dots = 0
    l1 = len(domain1)
    l2 = len(domain2)
    m = min(l1, l2)

    while i >= -m:
        c1 = domain1[i]
        c2 = domain2[i]

        if c1 == c2:
            if c1 == '.':
                dots += 1
                if dots == 2:
                    return True
        else:
            return False

        i -= 1

    if l1 == l2:
        return True

    if dots == 0:
        return False

    c = domain1[i] if l1 > m else domain2[i]
    return c == '.'


def parse_origin_from_url(url):
    url = url.strip()
    if not url:
        return

    if not (url.startswith('http://') or url.startswith('https://') or
            url.startswith('//')):
        url = '//' + url

    parsed = urlparse(url)
    port = parsed.port
    scheme = parsed.scheme

    if scheme == '':
        scheme = 'https' if port == 443 else 'http'

    if port == 443 and scheme == 'https':
        netloc = parsed.netloc.replace(':443', '')
    elif port == 80 and scheme == 'http':
        netloc = parsed.netloc.replace(':80', '')
    else:
        netloc = parsed.netloc

    return '{}://{}'.format(scheme, netloc)


def decrypt_aes(content, key, charset='utf-8'):
    """
    AES解密方法 (默认使用AES/ECB/PKCS5Padding模式)

    Args:
        content (str): 待解密的内容（Base64编码）
        key (str): 解密密钥  长度为 16 24 32字节  即128位、192位、256位 3种。
        charset (str): 字符集，默认为'utf-8'

    Returns:
        str: 解密后的明文
    """
    # 将密钥转换为字节
    key_bytes = key.encode(charset)

    # Base64解码
    encrypted_data = base64.b64decode(content)

    # 创建AES解密器（ECB模式，PKCS5Padding）
    cipher = Cipher(
        algorithms.AES(key_bytes),
        modes.ECB(),
        backend=default_backend()
    )

    # 解密
    decryptor = cipher.decryptor()
    decrypted_data = decryptor.update(encrypted_data) + decryptor.finalize()

    # 去除PKCS5填充并转换为字符串
    pad_len = decrypted_data[-1]
    decrypted_data = decrypted_data[:-pad_len]

    return decrypted_data.decode(charset)


def encrypt_aes(content, key, charset='utf-8'):
    """
    AES加密方法 (默认使用AES/ECB/PKCS5Padding模式)

    Args:
        content (str): 待加密的明文
        key (str): 加密密钥 长度为 16 24 32字节 即128位、192位、256位 3种。
        charset (str): 字符集，默认为'utf-8'

    Returns:
        str: 加密后的内容（Base64编码）
    """
    # 将密钥和内容转换为字节
    key_bytes = key.encode(charset)
    content_bytes = content.encode(charset)

    # 添加PKCS5填充
    block_size = 16  # AES块大小
    pad_len = block_size - (len(content_bytes) % block_size)
    if pad_len == 0:
        pad_len = block_size
    content_bytes += bytes([pad_len] * pad_len)

    # 创建AES加密器（ECB模式，PKCS5Padding）
    cipher = Cipher(
        algorithms.AES(key_bytes),
        modes.ECB(),
        backend=default_backend()
    )
    encryptor = cipher.encryptor()
    encrypted_data = encryptor.update(content_bytes) + encryptor.finalize()

    # Base64编码并返回
    return base64.b64encode(encrypted_data).decode(charset)
