package io.digital.patterns.ref.data.service;

import org.apache.commons.io.IOUtils;
import org.json.JSONObject;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.TransformedResource;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static java.nio.charset.StandardCharsets.UTF_8;

@Configuration
public class UIConfig implements WebMvcConfigurer {

    private final Environment environment;

    public UIConfig(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/")
                .setViewName("forward:/index.html");
        registry.addViewController("/**/{path:[^\\.]*}")
                .setViewName("forward:/index.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**").addResourceLocations("classpath:/static/")
                .resourceChain(false)
                .addTransformer((request, resource, transformerChain) -> {
                    String html = IOUtils.toString(resource.getInputStream(), UTF_8);
                    if (html.contains("__ENVIRONMENT_CONFIG__")) {
                        final JSONObject jsonObject = new JSONObject();
                        jsonObject.put("authUrl", environment.getProperty("auth.url") + "/auth");
                        jsonObject.put("authRealm", environment.getProperty("auth.realm"));
                        jsonObject.put("authClientId", environment.getProperty("auth.clientId"));
                        jsonObject.put("serviceDeskUrl", environment.getProperty("serviceDesk.url"));
                        jsonObject.put("uiEnvironment", environment.getProperty("uiEnvironment"));
                        jsonObject.put("uiVersion", environment.getProperty("uiVersion"));
                        jsonObject.put("forms", Map.of(
                                "newDataSetForm", environment.getRequiredProperty("newDataSetForm"),
                                "editDataRowForm", environment.getRequiredProperty("editDataRowForm"),
                                "deleteDataRowForm", environment.getRequiredProperty("deleteDataRowForm")
                        ));
                        jsonObject.put("processes",
                               Map.of("newDataSetProcess", environment.getRequiredProperty("newDataSetProcess"),
                                     "deleteDataSetProcess",  environment.getRequiredProperty("deleteDataSetProcess"),
                                     "addDataRowProcess", environment.getRequiredProperty("addDataRowProcess"),
                                    "editDataRowProcess", environment.getRequiredProperty("editDataRowProcess"),
                                    "deleteDataRowProcess",environment.getRequiredProperty("deleteDataRowProcess")));

                        jsonObject.put("zipkinUrl", environment.getProperty("tracing.zipkin.ui.url"));
                        html = html.replace("__ENVIRONMENT_CONFIG__", jsonObject.toString());
                        return new TransformedResource(resource, html.getBytes());
                    }
                    return resource;
                });
    }


}

