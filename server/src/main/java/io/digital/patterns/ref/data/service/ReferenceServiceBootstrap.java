package io.digital.patterns.ref.data.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;

@Slf4j
@SpringBootApplication
@EnableZuulProxy
public class ReferenceServiceBootstrap {
    public static void main (String[] args) {
        log.info("Starting reference data service...");
        SpringApplication.run(ReferenceServiceBootstrap.class, args);
    }
}
