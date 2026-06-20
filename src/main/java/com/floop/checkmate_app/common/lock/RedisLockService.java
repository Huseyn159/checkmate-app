package com.floop.checkmate_app.common.lock;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RedisLockService {

    private final StringRedisTemplate redis;

    // Lock-u yalnız öz token-i ilə açmaq üçün atomik Lua script
    private static final String RELEASE_SCRIPT =
            "if redis.call('get', KEYS[1]) == ARGV[1] " +
                    "then return redis.call('del', KEYS[1]) else return 0 end";

    /** Lock-u tutmağa çalışır. Uğurlu olsa token qaytarır, olmasa null. */
    public String tryLock(String key, Duration ttl) {
        String token = UUID.randomUUID().toString();
        Boolean acquired = redis.opsForValue().setIfAbsent(key, token, ttl);
        return Boolean.TRUE.equals(acquired) ? token : null;
    }

    /** Yalnız lock-u tutan unlock edə bilir (token yoxlanışı). */
    public void unlock(String key, String token) {
        redis.execute(new DefaultRedisScript<>(RELEASE_SCRIPT, Long.class),
                List.of(key), token);
    }
}