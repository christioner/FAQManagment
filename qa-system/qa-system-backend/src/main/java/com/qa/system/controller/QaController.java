package com.qa.system.controller;

import com.qa.system.common.Result;
import com.qa.system.dto.QaRequest;
import com.qa.system.entity.Qa;
import com.qa.system.service.QaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qa")
@RequiredArgsConstructor
public class QaController {
    
    private final QaService qaService;

    @GetMapping
    public Result<Page<Qa>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return Result.success(qaService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public Result<Qa> getById(@PathVariable Long id) {
        qaService.incrementView(id);
        return Result.success(qaService.findById(id));
    }

    @PostMapping
    public Result<Qa> create(@RequestBody QaRequest request) {
        // Mock user ID = 1
        return Result.success(qaService.create(request, 1L));
    }

    @PutMapping("/{id}")
    public Result<Qa> update(@PathVariable Long id, @RequestBody QaRequest request) {
        return Result.success(qaService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        qaService.delete(id);
        return Result.success();
    }

    @PostMapping("/{id}/like")
    public Result<Void> like(@PathVariable Long id) {
        qaService.incrementLike(id);
        return Result.success();
    }
}
